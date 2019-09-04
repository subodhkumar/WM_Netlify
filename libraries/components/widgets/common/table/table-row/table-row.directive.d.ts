import { Injector, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { TableComponent } from '../table.component';
export declare class TableRowDirective extends BaseComponent implements OnInit {
    table: TableComponent;
    static initializeProps: void;
    config: any;
    columnwidth: any;
    closeothers: any;
    content: any;
    expandicon: any;
    collapseicon: any;
    height: any;
    position: any;
    constructor(inj: Injector, table: TableComponent);
    populateConfig(): void;
    ngOnInit(): void;
    onPropertyChange(key: string, nv: any): void;
}
