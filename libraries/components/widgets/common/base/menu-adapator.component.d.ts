import { AfterViewInit } from '@angular/core';
import { StylableComponent } from './stylable.component';
export declare class MenuAdapterComponent extends StylableComponent implements AfterViewInit {
    private itemlabel;
    private menuRef;
    private pageScope;
    private binditemlabel;
    private binditemicon;
    private binditemaction;
    private binditemchildren;
    private binditemlink;
    private binduserrole;
    private menuRefQL;
    constructor(inj: any, WIDGET_CONFIG: any);
    onPropertyChange(key: string, nv: any, ov?: any): void;
    ngAfterViewInit(): void;
}
