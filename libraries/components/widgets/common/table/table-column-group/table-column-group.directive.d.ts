import { Injector, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { TableComponent } from '../table.component';
export declare class TableColumnGroupDirective extends BaseComponent implements OnInit {
    group: TableColumnGroupDirective;
    table: TableComponent;
    static initializeProps: void;
    accessroles: any;
    backgroundcolor: any;
    caption: any;
    colClass: any;
    name: any;
    textalignment: any;
    config: any;
    constructor(inj: Injector, group: TableColumnGroupDirective, table: TableComponent);
    populateConfig(): void;
    onPropertyChange(key: any, nv: any, ov?: any): void;
    ngOnInit(): void;
}
