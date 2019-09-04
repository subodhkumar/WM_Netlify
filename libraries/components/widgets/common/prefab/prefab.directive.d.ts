import { ChangeDetectorRef, ElementRef, Injector } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
export declare class PrefabDirective extends StylableComponent {
    widgetType: string;
    prefabName: string;
    name: string;
    propsReady: Function;
    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, prefabName: any);
    onStyleChange(key: string, nv: any, ov: any): void;
    setProps(config: any): void;
    protected handleEvent(): void;
    private prepareProps;
}
