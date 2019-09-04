import { Injector, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { TableComponent } from '../table.component';
export declare class TableRowActionDirective extends BaseComponent implements OnInit {
    table: TableComponent;
    static initializeProps: void;
    accessroles: any;
    action: any;
    caption: any;
    class: any;
    disabled: any;
    displayName: any;
    iconclass: any;
    key: any;
    show: any;
    tabindex: any;
    title: any;
    buttonDef: any;
    hyperlink: any;
    target: any;
    conditionalclass: any;
    conditionalstyle: any;
    constructor(inj: Injector, table: TableComponent, contexts: Array<any>);
    getTitle(): any;
    populateAction(): void;
    ngOnInit(): void;
}
